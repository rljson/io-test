import { Foo } from './foo.ts';

<<<<<<< HEAD

=======
>>>>>>> origin/main
/**
 * The example function demonstrates how the package works
 */
export const example = () => {
  const print = console.log;
  const assert = console.assert;

<<<<<<< HEAD
  const foo = new Foo();
  print(foo.foo());
  assert(foo.foo() === 'bar');
=======
  const validate = new Foo();
  print(validate.foo());
  assert(validate.foo() === 'bar');
>>>>>>> origin/main
};

export class X {}
