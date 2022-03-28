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

use crate::bit::UnsignedInt;
use crate::modulo;

/// contains one prime number
/// and some other values used to perform the number theoretic transform
pub struct Prime {
    prime: u32,
    /// `prime` = `coefficient` * 2<sup>`exponent`</sup> + 1
    coefficient: u32,
    /// `prime` = `coefficient` * 2<sup>`exponent`</sup> + 1
    exponent: u32,
    /// primitive root modulo `prime`,
    /// i.e. we have `primitive_root`<sup>i</sup> ≢ 1 (mod `prime`)
    /// for any i < `prime` - 1.
    primitive_root: u32,
}

impl Prime {
    pub fn value(&self) -> u32 {
        self.prime
    }

    /// construct `Prime` from `coefficient` and `exponent`,
    /// if `coefficient` * 2<sup>`exponent`</sup> + 1 is prime
    pub fn from_coef_exp(coefficient: u32, exponent: u32) -> Option<Prime> {
        let prime = coefficient * (1 << exponent) + 1;
        primal::is_prime(prime as u64).then(|| {
            let factors = prime_factors(prime - 1);
            let primitive_root = (2..)
                .find(|&i| is_primitive_root(i, prime, &factors))
                .unwrap();
            Prime {
                prime,
                coefficient,
                exponent,
                primitive_root,
            }
        })
    }
}

impl Prime {
    /// returns `z` with `z`<sup>2<sup>`n`</sup></sup> ≡ 1 (mod `prime`)
    fn zeta(&self, n: u32) -> Option<u32> {
        (n <= self.exponent).then(|| {
            let mut ret = modulo::pow(self.primitive_root, self.coefficient, self.prime);
            for _ in n..self.exponent {
                modulo::mul_assign(ret, &mut ret, self.prime);
            }
            ret
        })
    }

    /// returns `Vec` with the length of 2<sup>`n`</sup>
    /// and its i-th element is `zeta`<sup>i</sup>
    pub fn zetas(&self, n: u32) -> Option<Vec<u32>> {
        self.zeta(n).map(|zeta| {
            std::iter::successors(Some(1), |&x| match modulo::mul(x, zeta, self.prime) {
                1 => None,
                other => Some(other),
            })
            .collect()
        })
    }
}

impl Prime {
    /// perform the number theoretic transform
    fn transform(&self, x: &mut Vec<u32>, zetas: &[u32], inverse: bool) {
        let length = x.len();
        let mask = length - 1;
        let mut bit = length / 2;
        let mut ret = vec![0; length];
        while bit > 0 {
            for (j, tmp) in ret.iter_mut().enumerate() {
                let mut upper = j & !(bit - 1);
                let gapped = upper << 1 & mask | j ^ upper;
                if inverse && upper != 0 {
                    upper = length - upper
                };
                *tmp = modulo::add(
                    x[gapped],
                    modulo::mul(zetas[upper], x[gapped | bit], self.prime),
                    self.prime,
                );
            }
            std::mem::swap(x, &mut ret);
            bit /= 2;
        }
    }

    pub fn poly_scale(&self, xs: &mut [u32], scalar: u32) {
        for x in xs {
            modulo::mul_assign(scalar, x, self.prime);
        }
    }
}

#[test]
fn test_transform() {
    use rand::prelude::*;
    let mut rng = rand::thread_rng();
    let bit = 10;
    for p in (0..1 << (31 - bit))
        .rev()
        .filter_map(|i| Prime::from_coef_exp(i, bit))
        .take(100)
    {
        assert!(p.zeta(bit + 1).is_none());
        let zetas = p.zetas(bit).unwrap();
        let size = 1u32 << bit;
        assert_eq!(zetas.len(), size as usize);
        let dist = rand::distributions::Uniform::from(0..p.value());
        let before: Vec<_> = (0..size).map(|_| dist.sample(&mut rng)).collect();
        let mut after = before.clone();
        p.transform(&mut after, &zetas, false);
        p.transform(&mut after, &zetas, true);
        p.poly_scale(&mut after, modulo::inv(size, p.value()));
        assert_eq!(before, after);
    }
}

impl Prime {
    /// multiply `xs` to `ys`
    pub fn polymul(&self, mut xs: Vec<u32>, mut ys: Vec<u32>) -> Option<Vec<u32>> {
        let bit = (xs.len() + ys.len() - 2).bit_width();
        let n = 1 << bit;
        xs.resize(n, 0);
        ys.resize(n, 0);
        self.zetas(bit).map(|zetas| {
            self.transform(&mut xs, &zetas, false);
            self.transform(&mut ys, &zetas, false);
            for (x, y) in xs.into_iter().zip(&mut ys) {
                modulo::mul_assign(x, y, self.prime);
            }
            self.transform(&mut ys, &zetas, true);
            self.poly_scale(&mut ys, modulo::inv(n as u32, self.prime));
            ys
        })
    }

    pub fn polyinv(&self, mut xs: Vec<u32>, bit: u32) -> Option<Vec<u32>> {
        let length = 1 << bit;
        let mut ret = vec![0; length];
        xs.resize(length, 0);
        ret[0] = modulo::inv(xs[0], self.prime);
        let mut prev_length = 1;
        let mut next_length = 1;
        let mut inv_next_length = 1;
        for i in 0..bit {
            next_length *= 2;
            modulo::div_assign(2, &mut inv_next_length, self.prime);

            let zetas = self.zetas(i + 1)?;

            let mut partial = ret[..prev_length].to_vec();
            partial.resize(next_length, 0);
            self.transform(&mut partial, &zetas, false);

            let mut tmp = xs[..next_length].to_vec();
            self.transform(&mut tmp, &zetas, false);
            for (x, y) in tmp.iter_mut().zip(&mut partial) {
                modulo::mul_assign(*y, x, self.prime);
            }
            self.transform(&mut tmp, &zetas, true);
            tmp[..prev_length].fill(0);
            self.poly_scale(&mut tmp[prev_length..], inv_next_length);
            self.transform(&mut tmp, &zetas, false);
            for (x, y) in tmp.iter_mut().zip(&partial) {
                modulo::mul_assign(*y, x, self.prime);
            }
            self.transform(&mut tmp, &zetas, true);
            self.poly_scale(&mut tmp, inv_next_length);
            for (x, y) in ret[prev_length..next_length]
                .iter_mut()
                .zip(&tmp[prev_length..next_length])
            {
                *x = modulo::sub(0, *y, self.prime);
            }

            prev_length = next_length;
        }
        Some(ret)
    }
}

#[test]
fn test_polyinv() {
    use rand::prelude::*;
    let mut rng = rand::thread_rng();
    let bit = 20;
    for p in (0..1 << (31 - bit))
        .rev()
        .filter_map(|i| Prime::from_coef_exp(i, bit))
        .take(50)
    {
        let target_bit = 10;
        let target_size = 1 << target_bit;

        let dist = rand::distributions::Uniform::from(0..p.value());
        let fps: Vec<_> = (0..10).map(|_| dist.sample(&mut rng)).collect();

        let inv = p.polyinv(fps.clone(), target_bit).unwrap();
        assert_eq!(inv.len(), target_size);
        let one = p.polymul(fps, inv).unwrap();
        assert_eq!(one[0], 1);
        for &x in &one[1..target_size] {
            assert_eq!(x, 0);
        }
    }
}

impl Prime {
    pub fn polydiff(&self, xs: &mut Vec<u32>) {
        for (i, x) in xs.iter_mut().enumerate() {
            modulo::mul_assign(i as u32, x, self.prime);
        }
        if xs.len() > 1 {
            xs.remove(0);
        }
    }
}

/// returns the prime factors of `n`. ignores their orders
fn prime_factors(mut n: u32) -> Vec<u32> {
    let mut ret = Vec::new();
    for i in 2.. {
        if i * i > n {
            break;
        }
        if n % i == 0 {
            ret.push(i);
            while n % i == 0 {
                n /= i;
            }
        }
    }
    if n != 1 {
        ret.push(n);
    }
    ret
}

#[test]
fn test_prime_factors() {
    assert_eq!(prime_factors(72), [2, 3]);
    assert_eq!(prime_factors(60), [2, 3, 5]);
    assert_eq!(prime_factors(34), [2, 17]);
    assert_eq!(prime_factors(19), [19]);
}

/// check if `g` is a primitive root modulo `prime`.
///
/// requirement: `factors` must contain all prime factors of `prime` - 1
fn is_primitive_root(g: u32, prime: u32, factors: &[u32]) -> bool {
    factors
        .iter()
        .all(|f| modulo::pow(g, prime / f, prime) != 1)
}

#[test]
fn test_primitive_root() {
    let prime = Prime::from_coef_exp(5, 25).unwrap();
    assert_eq!(prime.primitive_root, 3);
    let prime = Prime::from_coef_exp(7, 26).unwrap();
    assert_eq!(prime.primitive_root, 3);
    let prime = Prime::from_coef_exp(45, 24).unwrap();
    assert_eq!(prime.primitive_root, 11);
    let prime = Prime::from_coef_exp(119, 23).unwrap();
    assert_eq!(prime.primitive_root, 3);
}
