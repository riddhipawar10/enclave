import { useContext } from "react";
import RBACContext from "./RBACContext";

export const useRBAC = () => {
  const context = useContext(RBACContext);

  if (context === undefined) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }

  return context;
};

export default useRBAC;