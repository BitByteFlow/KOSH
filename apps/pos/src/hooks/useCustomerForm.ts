import { useState, useCallback, useMemo } from "react";
import type { CustomerFormData, CustomerFormErrors } from "../types/checkout";

interface UseCustomerFormOptions {
	onSubmit?: (data: CustomerFormData) => void;
	onReset?: () => void;
}

export const useCustomerForm = (options?: UseCustomerFormOptions) => {
	const [formData, setFormData] = useState<CustomerFormData>({
		name: "",
		email: "",
		contact: "",
	});
	const [errors, setErrors] = useState<CustomerFormErrors>({});
	const [touched, setTouched] = useState<
		Record<keyof CustomerFormData, boolean>
	>({
		name: false,
		email: false,
		contact: false,
	});

	const validateField = useCallback(
		(field: keyof CustomerFormData, value: string): string | undefined => {
			switch (field) {
				case "name":
					if (!value.trim()) return "Customer name is required";
					if (value.trim().length < 2)
						return "Name must be at least 2 characters";
					return undefined;
				case "email": {
					if (!value.trim()) return undefined;
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!emailRegex.test(value)) return "Invalid email format";
					return undefined;
				}
				case "contact": {
					if (!value.trim()) return "Customer contact is required";
					const phoneRegex = /^\+?[\d\s-()]{10,}$/;
					if (!phoneRegex.test(value))
						return "Enter a valid contact number (min 10 digits)";
					return undefined;
				}
				default:
					return undefined;
			}
		},
		[],
	);

	const validateForm = useCallback(
		(data: CustomerFormData): CustomerFormErrors => {
			const newErrors: CustomerFormErrors = {};

			const nameError = validateField("name", data.name);
			if (nameError) newErrors.name = nameError;

			if (data.email) {
				const emailError = validateField("email", data.email);
				if (emailError) newErrors.email = emailError;
			}

			const contactError = validateField("contact", data.contact);
			if (contactError) newErrors.contact = contactError;

			return newErrors;
		},
		[validateField],
	);

	const handleChange = useCallback(
		(field: keyof CustomerFormData) =>
			(e: React.ChangeEvent<HTMLInputElement>) => {
				const value = e.target.value;
				setFormData((prev) => ({ ...prev, [field]: value }));
				setTouched((prev) => ({ ...prev, [field]: true }));

				const error = validateField(field, value);
				setErrors((prev) => ({ ...prev, [field]: error }));
			},
		[validateField],
	);

	const handleBlur = useCallback(
		(field: keyof CustomerFormData) => () => {
			setTouched((prev) => ({ ...prev, [field]: true }));
		},
		[],
	);

	const isValid = useMemo(() => {
		const validationErrors = validateForm(formData);
		return Object.keys(validationErrors).length === 0;
	}, [formData, validateForm]);

	const isSubmitReady = useMemo(() => {
		if (!formData.name.trim() || !formData.contact.trim()) return false;
		const criticalErrors = validateForm(formData);
		return Object.keys(criticalErrors).length === 0;
	}, [formData, validateForm]);

	const reset = useCallback(() => {
		setFormData({ name: "", email: "", contact: "" });
		setErrors({});
		setTouched({ name: false, email: false, contact: false });
		options?.onReset?.();
	}, [options]);

	const submit = useCallback((): CustomerFormData | null => {
		const validationErrors = validateForm(formData);
		setErrors(validationErrors);
		setTouched({ name: true, email: true, contact: true });

		if (Object.keys(validationErrors).length > 0) {
			return null;
		}

		const cleanData = {
			name: formData.name.trim(),
			email: formData.email.trim(),
			contact: formData.contact.trim(),
		};

		options?.onSubmit?.(cleanData);
		return cleanData;
	}, [formData, validateForm, options]);

	return {
		formData,
		errors,
		touched,
		isValid,
		isSubmitReady,
		handleChange,
		handleBlur,
		reset,
		submit,
		setFormData,
	};
};
