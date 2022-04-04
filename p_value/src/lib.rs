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
use num::{BigRational, BigUint, One, ToPrimitive, Zero};
use wasm_bindgen::prelude::*;

use serde::Serialize;

#[derive(Serialize)]
pub struct Value {
    pub pvalue: f64,
    pub numer: String,
    pub denom: String,
}

#[wasm_bindgen(module = "/progress.js")]
extern "C" {
    async fn show_progress(s: &str);
}

#[wasm_bindgen]
pub async fn p_value_1(n: u32, k: u32) -> String {
    serde_json::to_string(&p_value(n, k, p_value_modulo::p_value_modulo_1).await).unwrap()
}

#[wasm_bindgen]
pub async fn p_value_2(n: u32, k: u32) -> String {
    serde_json::to_string(&p_value(n, k, p_value_modulo::p_value_modulo_2).await).unwrap()
}

async fn p_value(n: u32, k: u32, p_value_modulo: fn(u32, u32, &Prime) -> u32) -> Value {
    if k == n {
        return Value {
            pvalue: 1.,
            numer: '1'.to_string(),
            denom: '1'.to_string(),
        };
    }
    let bit = n.bit_width() + 1;
    let denom = big_binom(n * 2, n);
    let primes: Vec<_> = (0..1 << (31 - bit))
        .rev()
        .filter_map(|i| Prime::from_coef_exp(i, bit))
        .scan(BigUint::one(), |product, prime| {
            (*product < denom).then(|| {
                *product *= BigUint::from(prime.value());
                prime
            })
        }).collect();
    let mut numer = BigUint::zero();
    let mut modulus: BigUint = One::one();
    for (i, prime) in primes.iter().enumerate() {
        let p = prime.value().into();
        numer += sub_mod(p_value_modulo(n, k, &prime).into(), &numer % &p, &p)
            * inv_mod(&modulus, &p)
            % &p
            * &modulus;
        modulus *= &p;
        show_progress(&format!("{} / {}", i, primes.len())).await;
    }
    let ret = BigRational::new((&denom - numer).into(), denom.into());
    show_progress("").await;
    Value {
        pvalue: ret.to_f64().unwrap(),
        numer: ret.numer().to_string(),
        denom: ret.denom().to_string(),
    }
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
