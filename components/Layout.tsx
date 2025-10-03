import React from "react";
import { Footer } from "./footer";
// import Navbar from "./Navbar";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Navbar /> */}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
