import { AbstractControl, FormArray, FormControl, FormGroup, NonNullableFormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { CategoryDto } from '../models/category-dto';
import { ProductDto } from '../models/product-dto';
import { OrderItemDto } from '../models/order-item-dto';
import { OrderDto } from '../models/order-dto';

// Treat all whitespace-only strings as invalid alongside required.
const whitespaceValidator: ValidatorFn = (control: AbstractControl) => {
  const value = (control.value ?? '') as string;
  return value.trim().length === 0 ? { whitespace: true } : null;
};

const trimRequired: ValidatorFn[] = [Validators.required, whitespaceValidator];

export function buildLoginForm(fb: NonNullableFormBuilder): FormGroup<{ email: FormControl<string>; password: FormControl<string> }> {
  return fb.group({
    email: fb.control('', { validators: [...trimRequired, Validators.email] }),
    password: fb.control('', { validators: trimRequired })
  });
}

export function buildRegisterForm(fb: NonNullableFormBuilder): FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}> {
  return fb.group({
    firstName: fb.control('', { validators: [...trimRequired, Validators.maxLength(100)] }),
    lastName: fb.control('', { validators: [...trimRequired, Validators.maxLength(100)] }),
    email: fb.control('', { validators: [...trimRequired, Validators.email] }),
    password: fb.control('', { validators: [...trimRequired, Validators.minLength(8), Validators.maxLength(120)] })
  });
}

export function buildCategoryForm(fb: NonNullableFormBuilder): FormGroup<{ name: FormControl<string>; description: FormControl<string | null> }> {
  return fb.group({
    name: fb.control('', { validators: [...trimRequired, Validators.maxLength(150)] }),
    description: fb.control<string | null>(null)
  });
}

export function buildProductForm(fb: NonNullableFormBuilder): FormGroup<{
  name: FormControl<string>;
  description: FormControl<string | null>;
  price: FormControl<number>;
  stockQuantity: FormControl<number>;
  imageUrl: FormControl<string | null>;
  categoryId: FormControl<number>;
}> {
  return fb.group({
    name: fb.control('', { validators: [...trimRequired, Validators.maxLength(255)] }),
    description: fb.control<string | null>(null),
    price: fb.control(0, { validators: [Validators.required, Validators.min(0)] }),
    stockQuantity: fb.control(0, { validators: [Validators.required, Validators.min(0)] }),
    imageUrl: fb.control<string | null>(null),
    categoryId: fb.control(0, { validators: [Validators.required, Validators.min(1)] })
  });
}

export function buildOrderItemForm(fb: NonNullableFormBuilder): FormGroup<{
  productId: FormControl<number>;
  quantity: FormControl<number>;
}> {
  return fb.group({
    productId: fb.control(0, { validators: [Validators.required, Validators.min(1)] }),
    quantity: fb.control(1, { validators: [Validators.required, Validators.min(1)] })
  });
}

export function buildOrderForm(fb: NonNullableFormBuilder): FormGroup<{
  shippingAddress: FormControl<string>;
  items: FormArray<FormGroup<{ productId: FormControl<number>; quantity: FormControl<number> }>>;
}> {
  return fb.group({
    shippingAddress: fb.control('', { validators: trimRequired }),
    items: fb.array([buildOrderItemForm(fb)], { validators: [minItemsValidator(1)] })
  });
}

function minItemsValidator(min: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (!(control instanceof FormArray)) {
      return null;
    }
    return control.length >= min ? null : { minItems: { required: min, actual: control.length } };
  };
}
