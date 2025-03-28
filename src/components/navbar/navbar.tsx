import {
  Navbar as NextNavbar,
  NavbarBrand,
  NavbarContent,
} from "@nextui-org/navbar";
import Marquee from "./marquee";
import Link from "next/link";
import DropdownContainer from "./dropdown";
import { getNavbarCategories } from "@/lib/api/get-category-tree";
import { Button } from "@nextui-org/button";
import { getFilteredProduct } from "@/lib/api/products/get-filtered-products";
import Drawer from "../cart/drawer";
import Profile from "./profile";
import SidebarNav from "./navbarSM/sidebar-nav";
import Search from "./search";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMarqueeOffers } from "@/lib/api/get-marquee-offers";
import Image from "next/image";

export default async function Navbar() {
  const navItems = await getNavbarCategories();
  const session = await getServerSession(authOptions);
  const popular = await getFilteredProduct({
    category: "popular",
    sort: "popular",
  });

  const marqueeOffers = await getMarqueeOffers();

  return (
    <>
      {marqueeOffers && <Marquee offers={marqueeOffers.offers} />}
      <NextNavbar
        shouldHideOnScroll
        classNames={{
          wrapper:
            "h-auto max-w-7xl px-2 py-3.5 xl:px-0 flex flex-col items-start px-4",
        }}
      >
        <div className="flex w-full items-center">
            <Link
              href="/"
              className="navbar-item p-0 text-lg font-semibold md:text-2xl"
            >
          <NavbarBrand className="flex-grow-0 ">
              <Image src="/logo.png" alt="Logo" width={74} height={74} />
              
          </NavbarBrand>
            </Link>
          <NavbarContent
            className="me-3 hidden flex-1 ps-5 md:block"
            justify="center"
          >
            <Search bestSeller={popular} />
          </NavbarContent>
          <NavbarContent
            className="flex items-center gap-4 md:!flex-grow-0"
            justify="end"
          >
            <div className="hidden gap-4 lg:flex">
              {navItems?.map((item, i) => (
                <DropdownContainer child={item.child} key={i}>
                  {item.parent}
                </DropdownContainer>
              ))}
              <Button
                disableRipple
                className="min-w-0 bg-transparent p-0 font-medium data-[hover=true]:bg-transparent"
                radius="sm"
                variant="light"
              >
                <Link href={"/store"}>Store</Link>
              </Button>
            </div>
            <div className="flex items-center gap-5">
              <Drawer />
              {session ? (
                <Profile session={session} />
              ) : (
                <Button
                  disableRipple
                  className="min-w-0 bg-transparent p-0 font-medium data-[hover=true]:bg-transparent"
                  radius="sm"
                  variant="light"
                >
                  <Link href={"/authentication"}>Sign in</Link>
                </Button>
              )}
            </div>

            {/* For Small Screen */}
            <div className="flex items-center gap-3 lg:hidden">
              <SidebarNav navItems={navItems} />
            </div>
          </NavbarContent>
        </div>
        <div className="w-full px-3 md:hidden">
          <Search bestSeller={popular} />
        </div>
      </NextNavbar>
    </>
  );
}
