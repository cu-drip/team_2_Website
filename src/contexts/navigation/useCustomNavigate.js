import { useContext } from "react";
import { CustomNavigateContext } from "./CustomNavigateProvider.jsx";

export function useCustomNavigate() {
    return useContext(CustomNavigateContext);
}
