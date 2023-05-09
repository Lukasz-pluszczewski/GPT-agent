import nerdamer from 'nerdamer';
import 'nerdamer/all';

export const solveEquation = (equation: string) => {
  try {
    const equationInstance = nerdamer(equation);

    const results = equationInstance?.solveFor('x')?.toString()?.split(',');
    return results.map(expression => nerdamer(expression).evaluate().toDecimal());
  } catch (error) {
    return null;
  }
}
