import HeaderComponent from "@/components/parts/header/Header.parts";
import type { MainLayoutProps } from "./type";

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div>
      <HeaderComponent />
      <div>{children}</div>
    </div>
  );
};

export default MainLayout;
