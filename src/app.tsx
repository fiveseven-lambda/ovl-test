import * as React from 'react';
import { KaTeX } from './katex';

import { Main } from './main';
import { WidthSwitch, Pkg } from './types';

export const App = () => {
  const [width, setWidth] = React.useState(window.innerWidth);
  const [pkg, setPkg] = React.useState<Pkg>(null);
  React.useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
  React.useEffect(() => {
    import('../pkg').then(wasm => {
      setPkg({
        fn: {
          'OVL-1': wasm.p_value_1,
          'OVL-2': wasm.p_value_2,
        }
      });
    });
  });
  const widthSwitch = width >= 900 ? 'wide' : 'narrow';
  return <div>
    <Header widthSwitch={widthSwitch}/>
    <div>
      <Description widthSwitch={widthSwitch}/>
      <Main widthSwitch={widthSwitch} pkg={pkg}/>
    </div>
    <Footer widthSwitch={widthSwitch}/>
  </div>
}

const Header = ({widthSwitch}: {widthSwitch: WidthSwitch}) => <header>
  <h1>
    The OVL-<KaTeX text='q' /> Test
  </h1>
</header>

const Description = ({widthSwitch}: {widthSwitch: WidthSwitch}) => <div>
  <h2>Summary</h2>
  <p>
    This page implements
    the OVL-<KaTeX text='q' /> (<KaTeX text='q = 1, 2' />),
    a statistical framework for two-sample testing.
    Here you can test whether two samples come from the same distribution.
  </p>
  <h2>Details</h2>
  <p>
    Let <KaTeX text='X_1, \ldots, X_m'/> and <KaTeX text='Y_1, \ldots, Y_n'/> be
    independent real random variables with continuous distribution functions <KaTeX text='F_0' /> and <KaTeX text='F_1' />, respectively.
    You can calculate from their values the OVL-<KaTeX text='q' /> statistic <KaTeX text='\rho_{q,m,n}' /> and its <KaTeX text='p' />-value
    under the null hypothesis <KaTeX text='H_0: F_0 = F_1'/>.
    The alternative hypothesis is <KaTeX text='H_1: F_0 \neq F_1'/>.
  </p>
  <p>
    The OVL-1 is equivalent to the <a href='https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test'>two-sample Kolmogorov-Smirnov test</a>.
  </p>
  <p>
    Since <KaTeX text='F_0'/> and <KaTeX text='F_1'/> are supposed to be continuous,
    the values of <KaTeX text='X_1, \ldots, X_m, Y_1, \ldots, Y_n'/> must be all distinct.
  </p>
  <p>
    This page computes <KaTeX text='\rho_{q,m,n}'/> and its <KaTeX text='p'/>-value where <KaTeX text='q\in\{1,2\}'/> and <KaTeX text='m=n'/>.
    It works completely on your browser: the input data will not be transmitted to any external server.
  </p>
</div>

const Footer = ({widthSwitch}: {widthSwitch: WidthSwitch}) => <footer>
  <p>The source code used in this page is published <a href='https://github.com/fiveseven-lambda/OVL-test'>here</a>, under the GPLv3 license.</p>
  <p>© 2022 Atsushi Komaba</p>
</footer>
