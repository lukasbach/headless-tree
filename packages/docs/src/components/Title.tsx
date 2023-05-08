import React, { ReactNode } from "react";

type TitleProps = {
  children: ReactNode;
};

export default function Title({ children }: TitleProps) {
  return <h1>{children}</h1>;
}
