import styled from "styled-components";
import {
  Accordion,
  AccordionItem,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export const Header = styled.header`
  background-color: #282c34;
  min-height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: white;
`;

export const Body = styled.div`
  align-items: center;
  background-color: #282c34;
  color: white;
  display: flex;
  flex-direction: column;
  font-size: calc(10px + 2vmin);
  justify-content: center;
  min-height: calc(100vh - 70px);
`;

export const Image = styled.img`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

export const CustomLink = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #61dafb;
  margin-top: 10px;
`;

export const Button = styled.button`
  background-color: white;
  border: none;
  border-radius: 8px;
  color: #282c34;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  margin: 0px 20px;
  padding: 12px 24px;

  ${(props) => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;

export const Imagediv = styled.div`
  display: flex;
  flex-grow: 1;
`;

export const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 1rem;
  color: #334061;
  opacity: 0.7;
  font-weight: bold;
  cursor: pointer;
  margin-right: 1rem;
  border-radius: 6px;
  text-decoration: none;
  background: ${(props) => (props.selected ? "#bdddf8" : "white")};

  &:hover {
    background: #bdddf8;
  }
`;

export const Logo = styled.img`
  padding: 1rem;
  height: 2.7rem;
  margin-left: 3rem;
  cursor: pointer;
`;

export const BodyMain = styled.div`
  background-image: linear-gradient(
    110.21deg,
    rgba(45, 84, 194, 0.12) 8.95%,
    rgba(7, 177, 199, 0.13) 114.8%
  );
  height: 19rem;
  width: 100%;
  margin-top: 8.6rem;
  text-align: center;
  padding: 5rem 0rem;
`;

export const Main = styled.div`
  margin: -7rem 12rem;
  margin-bottom: 5rem;
  border-radius: 8px;
  position: relative;
  box-shadow: 0px 5px 100px -23px rgb(0 0 0 / 5%);
  padding: 2rem 5rem;
  padding-bottom: 4rem;
  font-family: "Inter";
  background-color: white;
`;

export const Title = styled.h1`
  background: -webkit-linear-gradient(left, #2d54c2 8.95%, #07a5bb 94.8%);
  font-family: "Inter";
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 64px;
`;

export const SubTitle = styled.h5`
  color: #334061;
  font-size: 19px;
  font-weight: normal;
  line-height: 0.2;
  font-family: "Inter";
`;

export const Text = styled.h4`
  color: #334061;
  font-family: "Inter";
  font-size: 20px;
  font-weight: normal;
  line-height: 1.8;
`;

export const List = styled.h4`
  color: #334061;
  font-family: "Inter";
  font-size: 20px;
  font-weight: normal;
  line-height: 1.8;
  margin-left: 2rem;
`;

export const FloatingDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
`;

export const FloatingInnerLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  color: white;
  transition: all 0.2s linear;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const FloatingInnerDiv = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 15px;
`;

export const FloatingSpan = styled.span`
  background: rgba(0, 0, 0, 0.32);
  padding: 4px 6px;
  display: inline-block;
  margin-right: 10px;
  border-radius: 4px;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  position: relative;
`;

export const FloatingImg = styled.img`
  display: inline !important;
  border: none !important;
  box-shadow: none !important;
  height: 1em !important;
  width: 1em !important;
  margin: 0 0.07em !important;
  vertical-align: -0.1em !important;
  background: none !important;
  padding: 0 !important;
`;

export const Note = styled.div`
  text-align: center;
  color: #ee0902;
  font-size: 16px;
  font-weight: 600;
  margin-top: 3rem;
`;

export const ClaimButton = styled.button`
  margin-top: 1rem;
  display: inline-flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  text-align: center;
  font-weight: 600;
  font-size: 17px;
  padding: 16px 24px;
  background-color: #4977f9;
  color: white;
  transition: all ease 250ms;
  line-height: 20px;
  border-radius: 6px;
  outline: none !important;
  border: 1px solid #4977f9;
  box-shadow: 0px 4px 6px rgb(64 112 244 / 16%);
  font-family: "Inter";
  cursor: pointer;
  min-width: 208px;

  &:hover {
    background-color: #2251d8;
    color: #fff;
  }

  &:disabled {
    background-color: #83a2f7 !important;
    border: 1px solid #83a2f7 !important;
    cursor: not-allowed !important;
  }
`;

export const ConnectButton = styled.button`
  padding: 12px 24px;
  margin: 2rem 3rem 2rem 1rem;
  font-size: 15px;
  display: flex;
  justify-content: center;
  text-align: center;
  font-weight: 600;
  background-color: #f4f7ff;
  color: #4977f9;
  box-shadow: 0px 0px 0px rgb(0 0 0 / 4%);
  transition: all ease 250ms;
  line-height: 20px;
  border-radius: 6px;
  outline: none !important;
  border: 1px solid #4977f9;
  font-family: "Inter";
  cursor: pointer;

  &:hover {
    background-color: #4977f9;
    color: #fff;
  }
`;

export const BadgeButton = styled.button`
  background: #8247e5;
  color: white;
  border: none;
  border-radius: 13px;
  padding: 0.4rem 1rem;
  font-weight: bold;
`;

export const Bold = styled.span`
  font-weight: normal;
  color: #11c264;
  font-family: "Inter";
  font-size: 20px;
  font-weight: 600;
`;

export const AccordionDiv = styled(Accordion)`
  margin-top: 3rem;
  font-family: "Inter";
`;

export const AccordionItemDiv = styled(AccordionItem)`
  margin-top: 2rem;
  font-size: 20px;
  color: #525f80;
  font-weight: normal;
  font-family: "Inter";

  -webkit-transition: height 1s ease;
  -moz-transition: height 1s ease;
  -ms-transition: height 1s ease;
  -o-transition: height 1s ease;
  transition: height 1s ease;
`;

export const AccordionItemButtonDiv = styled(AccordionItemButton)`
  background-color: white;
  border: none;
  outline: none !important;
  font-family: "Inter";
  font-weight: 600;
  font-size: 22px;
  cursor: pointer;
  color: #334061;
  &:hover {
    border: none;
  }
  &:active {
    border: none;
  }
`;

export const FontAwesomeIconSet = styled(FontAwesomeIcon)`
  margin-right: 2rem;
`;

export const AccordionItemPanelDiv = styled(AccordionItemPanel)`
  font-size: 18px;
  margin: 2rem 3rem;
  font-family: "Inter";
  line-height: 1.8;
  text-align: justify;
  text-justify: inter-word;
  overflow: hidden;

  a {
    color: #4977f9;
    text-decoration: none;

    &:hover {
      border-bottom: 1px dotted;
    }
  }
`;

export const TopHeader = styled(Header)`
  background: linear-gradient(90.21deg, #2d54c2 8.95%, #07a5bb 94.8%);
  padding: 0rem 3rem;
  font-family: "Inter";
  font-size: 20px;
  height: 1rem;
  font-weight: bolder;
  text-align: center;
`;

export const ThanksHeading = styled.h4`
  font-weight: 600;
  font-size: 32px;
  line-height: 0;
  color: #0f1b38;
`;

export const MainHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
`;

export const MenuBar = styled(Header)`
  background-color: white;
  height: 5.5rem;
  box-shadow: 0 -3px 12px rgb(0 0 0 / 8%);
`;

export const Line = styled.hr`
  margin: 3rem 0rem;
  border-color: #efefef;
`;

export const NftGrid = styled.div`
  padding: 0px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(272px, 1fr));
  gap: 40px;
  margin-top: 2rem;
`;

export const NftItem = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0px 10px 20px rgb(0 0 0 / 5%);
`;

export const NftImage = styled.img`
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  position: relative;
  overflow: hidden;
  border-radius: 12px 12px 0px 0px;
`;

export const NftOnwerBlockie = styled.img`
  width: 32px;
  height: 32px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
`;

export const NftOnwerAddress = styled.span`
  margin-left: 12px;
`;

export const NftClaimedText = styled.span`
  color: #11c264;
  font-weight: bold;
  font-size: 15px;
`;

export const NftOwner = styled.div`
  padding: 12px 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #334061;
  font-size: 14px;
  font-weight: bold;
`;

export const NftClaimContainer = styled.div`
  background: linear-gradient(
    110.21deg,
    rgba(45, 84, 194, 0.12) 8.95%,
    rgba(7, 177, 199, 0.13) 114.8%
  );
  border-radius: 0px 0px 12px 12px;
  color: #334061;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 1rem;
  height: 32px;
`;

export const NftClaim = styled.div`
  color: #334061;
  display: flex;
  align-items: center;
`;

export const NftType = styled.span`
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  padding: 4px 12px;
  background: linear-gradient(90.21deg, #2d54c2 8.95%, #07a5bb 94.8%);
  border-radius: 24px;
`;

export const NftClaimButton = styled.button`
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  padding: 6px 12px;
  background-color: #4977f9;
  color: white;
  transition: all ease 250ms;
  line-height: 18px;
  border-radius: 6px;
  outline: none !important;
  border: 1px solid #4977f9;
  box-shadow: 0px 4px 6px rgb(64 112 244 / 16%);
  font-family: "Inter";
  cursor: pointer;
  min-width: 120px;

  &:hover {
    background-color: #2251d8;
    color: #fff;
  }

  &:disabled {
    background-color: #83a2f7 !important;
    border: 1px solid #83a2f7 !important;
    cursor: not-allowed !important;
  }
`;
