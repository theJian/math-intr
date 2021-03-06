import { MathNode } from './MathNode';
import { Stack } from './Stack';

export { RPNCalculator };

class RPNCalculator {
  constructor(
    private readonly rpn: Array<MathNode.Node>
  ) {}

  evaluate(scope?: Record<string, number>) {
    const stack = new Stack<number>();
    this.rpn.forEach(it => {
      if (it instanceof MathNode.Operand) {
        stack.push(it.value);
        return;
      }

      if (it instanceof MathNode.Operator) {
        const args = new Stack<number>();
        while (!stack.empty() && args.size() < it.arity) args.push(stack.pop()!);
        if (args.size() < it.arity) {
          throw new Error(`Operator expected to have ${it.arity} arguments, but got ${args.size()}`);
        }
        stack.push(it.apply(...args.toArray()))
        return;
      }

      if (it instanceof MathNode.Variable) {
        if (scope === undefined) {
          throw new Error(`Failed to substitute variable ${it.name}`);
        }

        const value = it.subs(scope);
        if (typeof value !== 'number') {
          throw new Error(`Expected substitution value of ${it.name} to be a number`);
        }

        stack.push(value);
        return;
      }

      throw new Error('Invalid RPN');
    })

    if (stack.empty()) {
      throw new Error('Empty input');
    }

    const result = stack.pop()!;
    return result;
  }
}
