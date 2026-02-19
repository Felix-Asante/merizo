import { useFormContext } from "react-hook-form";
import React from "react";
import type { FieldValues, RegisterOptions } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/base/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/ui/base/input-group";
import { cn } from "@/ui/utils";

interface FormInputProps {
  name: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  description?: string;
  type?: HTMLInputElement["type"];
  required?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  rules?:
    | Omit<
        RegisterOptions<FieldValues, string>,
        "disabled" | "setValueAs" | "valueAsNumber" | "valueAsDate"
      >
    | undefined;
  inputClassName?: string;
  disabled?: boolean;
}
export default function FormInput(
  props: Readonly<FormInputProps> & React.ComponentProps<"input">,
) {
  const {
    name,
    label,
    description,
    required,
    rules,
    defaultValue,
    startContent,
    endContent,
    inputClassName,
    ...inputProps
  } = props;

  const { control } = useFormContext();
  const id = React.useId();

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel htmlFor={id}>
              {label}
              {required && <span style={{ color: "red" }}> *</span>}
            </FormLabel>
          )}
          <FormControl>
            <InputGroup className={cn("h-11", props.disabled && "bg-muted")}>
              {startContent && (
                <InputGroupAddon>{startContent}</InputGroupAddon>
              )}
              <InputGroupInput
                {...field}
                {...inputProps}
                id={id}
                className={inputClassName}
              />
              {endContent && (
                <InputGroupAddon align="inline-end">
                  {endContent}
                </InputGroupAddon>
              )}
            </InputGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
