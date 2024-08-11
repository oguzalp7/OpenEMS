import { useState } from "react";

const useToggleSwitch = (initialState = true) => {
    const [isOn, setIsOn] = useState(initialState);
  
    const toggleSwitch = () => setIsOn(!isOn);
  
    return [isOn, toggleSwitch];
};

export default useToggleSwitch;