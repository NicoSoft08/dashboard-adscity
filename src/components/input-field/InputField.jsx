import React from 'react';
import './InputField.scss';

export default function InputField({ type, name, label, placeholder, options, multiple, required, value, onChange }) {
  return (
    <div className="Input-field">
      <label htmlFor={name}>{label}{required && <strong className='compulsory'>*</strong>} </label>

      {type === "text" || type === "number" || type === "textarea" || type === "date" || type === "time" || type === "email" || type === "password" || type === "country" || type === "city" || type === "address" ? (
        <input
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
        />
      ) : null}

      {type === "select" ? (
        <select id={name} name={name} value={value} required={required} onChange={onChange}>
          <option value="">Sélectionner</option>
          {options?.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      ) : null}

      {type === "radio" ? (
        <div className="radio-group">
          {options?.map((option, index) => (
            <label key={index}>
              <input
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                required={required}
                onChange={onChange}
              />
              {option}
            </label>
          ))}
        </div>
      ) : null}

      {type === "checkbox" ? (
        <div className="checkbox-group">
          {options?.map((option, index) => (
            <label key={index}>
              <input
                type="checkbox"
                name={name}
                value={option}
                checked={value.includes(option)}
                required={required}
                onChange={onChange}
              />
              {option}
            </label>
          ))}
        </div>
      ) : null}

      {type === "file" ? (
        <input
          type="file"
          id={name}
          name={name}
          multiple={multiple}
          required={required}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
};
