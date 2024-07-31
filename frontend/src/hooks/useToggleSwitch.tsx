import { useState } from "react";

const useToggleSwitch = (initialState = false) => {
    const [isOn, setIsOn] = useState(initialState);
  
    const toggleSwitch = () => setIsOn(!isOn);
  
    return [isOn, toggleSwitch];
};

export default useToggleSwitch;