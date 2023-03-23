import React, { useState } from "react";
import "./styles.css";

interface DropdownProps {
  items: string[];
}

const Dropdown: React.FC<DropdownProps> = ({ items }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="menu-dropdown">
      <button className="menu-dropdown__button" onClick={handleDropdownToggle}>
        Menu
      </button>
      {showDropdown && (
        <ul className="menu-dropdown__list">
          {items.map((item) => (
            <li className="menu-dropdown__item" key={item}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
