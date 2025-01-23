"use client"; // Ensures client-side rendering in Next.js
import React, { useState, useEffect } from "react";
import Select, { StylesConfig } from "react-select";

// Define the structure of a single option
interface Option {
    value: string;
    label: string;
}

// Define the props for the SelectComponent component
interface OptionProps {
    options: Option[]; // Options for the dropdown
    multiple?: boolean; // Enable multiple selections
    placeholder?: string; // Placeholder text
    label?: string; // Label for the dropdown
    onChange: (selectedValue: string | string[]) => void; // Handler for selection change
    value: string | string[] | null; // Controlled value for the select
}

const SelectComponent: React.FC<OptionProps> = ({ options, multiple = false, placeholder = "Select Type", label, onChange, value }) => {
    const [instanceId, setInstanceId] = useState<string>("");

    useEffect(() => {
        // Generate a stable ID after hydration
        setInstanceId("unique-instance-id");
    }, []);

    if (!instanceId) {
        // During SSR, render a placeholder or fallback
        return null;
    }

    // Custom styles for react-select
    const customStyles: StylesConfig<Option, boolean> = {
        control: (provided) => ({
            ...provided,
            backgroundColor: "black",
            borderColor: "gray",
            color: "white",
            padding: "0.25rem",
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "white",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "gray",
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: "black",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "blue" : "black",
            color: state.isFocused ? "white" : "gray",
            ":active": {
                backgroundColor: "blue",
            },
        }),
    };

    // Handle change event
    const handleChange = (selected: any) => {
        if (multiple) {
            // Store as an array of values
            const selectedValues = selected ? selected.map((option: Option) => option.value) : [];
            onChange(selectedValues);
        } else {
            // Store a single value
            onChange(selected ? selected.value : "");
        }
    };

    return (
        <div className="mb-4">
            {/* Label */}
            {label && (
                <label htmlFor={instanceId} className="block text-gray-300 mb-1 text-sm">
                    {label}
                </label>
            )}
            {/* React-Select */}
            <Select
                instanceId={instanceId}
                options={options}
                isMulti={multiple}
                styles={customStyles}
                placeholder={placeholder}
                value={
                    multiple
                        ? options.filter((option) => (value as string[])?.includes(option.value))
                        : options.find((option) => option.value === value)
                }
                onChange={handleChange}
            />
        </div>
    );
};

export default SelectComponent;
