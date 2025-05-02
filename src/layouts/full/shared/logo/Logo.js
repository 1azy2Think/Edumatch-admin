import { Link } from "react-router-dom";
import logo from "src/assets/images/logos/logo.png";
import { styled } from "@mui/material";

const LinkStyled = styled(Link)(() => ({
  height: "70px",
  width: "180px",
  overflow: "hidden",
  display: "block",
}));

const Logo = () => {
  return (
    <LinkStyled
      to="/"
      height={70}
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <img src={logo} alt="Logo" />
    </LinkStyled>
  );
};

export default Logo;
