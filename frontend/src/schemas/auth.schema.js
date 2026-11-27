import { z } from 'zod'

// ========================
// Login Schema
// ========================

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ'),

  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
})

// ========================
// Register Schema
// ========================

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập họ và tên'),

    email: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập email')
      .email('Email không hợp lệ'),

    phone: z
      .string()
      .trim()
      .max(20, 'Số điện thoại không hợp lệ')
      .optional(),

    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu')
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),

    confirmPassword: z
      .string()
      .min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })


// ========================
//  Forgot Password Schema
// ========================

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập email.')
    .email('Vui lòng nhập địa chỉ email hợp lệ.'),
})

// ========================
// Reset Password Schema
// ========================

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu mới')
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),

    confirmPassword: z
      .string()
      .min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })