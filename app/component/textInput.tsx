import React, { InputHTMLAttributes } from "react";

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    name: string;
    label: string;
    className?: string;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
    id,
    name,
    label,
    type = "text",
    className = "",
    required = false,
    ...props
}) => {
    return (
        <div className={`relative z-0 w-full mb-5 group ${className}`}>
            <input
                type={type}
                name={name}
                id={id}
                className="input-text peer"
                placeholder=" "
                required={required}
                {...props}
            />
            <label
                htmlFor={id}
                className="label-text absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] left-2.5 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75"
            >
                {label}
            </label>
        </div>
    );
};

export default FloatingInput;
