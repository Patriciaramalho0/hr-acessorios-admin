import { MdOutlineDashboard } from "react-icons/md";
import { LuUsers2 } from "react-icons/lu";
import { TbTruckDelivery } from "react-icons/tb";
import { RiCoupon2Line } from "react-icons/ri";
import { TbTag } from "react-icons/tb";
import { TbBriefcase } from "react-icons/tb";
import { MdOutlineShoppingCart } from "react-icons/md";

export const navItems = [
  {
    title: "Painel",
    url: "/",
    icon: <MdOutlineDashboard />,
  },
  {
    title: "Produtos",
    url: "/products",
    icon: <MdOutlineShoppingCart />,
  },
  {
    title: "Categorias",
    url: "/categories",
    icon: <TbTag />,
  },
  {
    title: "Clientes",
    url: "/customers",
    icon: <LuUsers2 />,
  },
  {
    title: "Pedidos",
    url: "/orders",
    icon: <TbTruckDelivery />,
  },
  {
    title: "Cupons",
    url: "/coupons",
    icon: <RiCoupon2Line />,
  },
  {
    title: "Equipe",
    url: "/staff",
    icon: <TbBriefcase />,
  },
];