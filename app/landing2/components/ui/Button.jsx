import React from "react";
import { cn } from "../../lib/utils";

export default function Button({ 
  children, 
  className = "", 
  variant = "primary", 
  onClick, 
  type = "button",
  ...props 
}) {
  const baseStyle = "inline-flex items-center justify-center font-montserrat font-extrabold uppercase tracking-wide rounded-full transition-all duration-300 active:scale-95 cursor-pointer text-center";
  
  const variants = {
    primary: "bg-[#e30a0a] hover:bg-[#ff1e1e] text-white shadow-[0_0_25px_rgba(227,10,10,0.45)] hover:shadow-[0_0_32px_rgba(227,10,10,0.6)] px-10 py-3.5 text-[13px] md:text-[14.5px]",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 text-[12px] md:text-[13px]",
  };

  return (
    <button
      type={type}
      className={cn(baseStyle, variants[variant], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
