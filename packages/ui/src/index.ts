/**
 * Solo Advertiser UI — Shared React component library
 *
 * Provides consistent, accessible UI components used across
 * the admin-web and business-web applications.
 */

// Core components
export { Button } from './components/button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/button';

export { Input } from './components/input';
export type { InputProps } from './components/input';

export { Badge } from './components/badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './components/badge';

export { Card, CardHeader, CardFooter } from './components/card';
export type { CardProps, CardHeaderProps, CardFooterProps } from './components/card';

export { Modal } from './components/modal';
export type { ModalProps } from './components/modal';

export { Toast, ToastContainer } from './components/toast';
export type { ToastProps, ToastContainerProps, ToastType } from './components/toast';

export { Spinner } from './components/spinner';
export type { SpinnerProps, SpinnerSize } from './components/spinner';

export { Skeleton, SkeletonText, SkeletonCard } from './components/skeleton';
export type { SkeletonProps, SkeletonTextProps, SkeletonCardProps } from './components/skeleton';

export { Table } from './components/table';
export type { TableProps, Column } from './components/table';

export { Pagination } from './components/pagination';
export type { PaginationProps } from './components/pagination';
