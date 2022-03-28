/*
Copyright (c) 2022 Atsushi Komaba

This file is part of OVL-test.

OVL-test is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

OVL-test is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with OVL-test.  If not, see <https://www.gnu.org/licenses/>.
*/

mod bit;
mod modulo;
mod number_theoretic_transform;
mod p_value_modulo;

use crate::bit::UnsignedInt;
use crate::number_theoretic_transform::Prime;
use crate::p_value_modulo::p_value_modulo;
use num::{BigRational, BigUint, One, ToPrimitive, Zero};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn p_value(n: u32, k: u32) -> f64 {
    if k == n {
        return 1.;
    }
    let bit = n.bit_width() + 1;
    let denom = big_binom(n * 2, n);
    let mut numer = BigUint::zero();
    for (prime, modulus) in (0..1 << (31 - bit))
        .rev()
        .filter_map(|i| Prime::from_coef_exp(i, bit))
        .scan(BigUint::one(), |product, prime| {
            (*product <= denom).then(|| {
                let p = prime.value();
                let ret = (prime, product.clone());
                *product *= BigUint::from(p);
                ret
            })
        })
    {
        let p = prime.value().into();
        numer += sub_mod(p_value_modulo(n, k, &prime).into(), &numer % &p, &p)
            * inv_mod(&modulus, &p)
            % &p
            * &modulus;
        // eprintln!("{}%", modulus.bits() as f64 / denom.bits() as f64 * 100.);
    }
    BigRational::new((&denom - numer).into(), denom.into())
        .to_f64()
        .unwrap()
}

fn big_binom(n: u32, r: u32) -> BigUint {
    if r == 0 {
        return One::one();
    }
    use std::collections::VecDeque;
    fn product(mut queue: VecDeque<BigUint>) -> BigUint {
        loop {
            let x = queue.pop_front().unwrap();
            if let Some(y) = queue.pop_front() {
                queue.push_back(x * y);
            } else {
                break x;
            }
        }
    }
    let numer = product((n - r + 1..=n).map(Into::into).collect());
    let denom = product((1..=r).map(Into::into).collect());
    numer / denom
}

fn inv_mod(value: &BigUint, modulus: &BigUint) -> BigUint {
    value.modpow(&(modulus - 2u32), modulus)
}

fn sub_mod(a: BigUint, b: BigUint, modulus: &BigUint) -> BigUint {
    if a >= b {
        a - b
    } else {
        a + (modulus - b)
    }
}
