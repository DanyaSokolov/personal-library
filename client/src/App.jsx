import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import styles from './App.module.scss'
import { Button, Breadcrumbs, Anchor, Popover } from '@mantine/core';
import LogoImg from "/logo.png"
import LogoImgWhite from "/logo_white.png"
import { IconLogin2, IconLogout } from '@tabler/icons-react';
import Login from './components/login/login';
import Books from "./components/books/books";

import { apiIsUser, apiLogout, setIsAuth } from './store/slices/authSlice';
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";

const useLocalState = () => {

  const dispatch = useDispatch()

  const navigate = useNavigate()

  const dispatchApiLogout = async () => {
    return dispatch(apiLogout())
  }
 
  const logout = async () => {
    await dispatchApiLogout()
    dispatch(setIsAuth(false))
    navigate("/login")
    notifications.show({
      color: "gray",
      title: 'Logged out',
      position: "bottom-center",
    })
  }

  const {
    name, isAuth,
    connection: { isAuthFetch, isLogoutingFetch }
  } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(apiIsUser())
  }, [])

  return { name, isAuth, isAuthFetch, logout, isLogoutingFetch }
}

function App() {

  const { name, isAuth, isAuthFetch, logout, isLogoutingFetch } = useLocalState()

  function BreadcrumbsNav() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter(x => x);

    return (
      <div className={styles.breadcrumbs_wrap}>
 <Breadcrumbs className={styles.breadcrumbs}>
        <Anchor component={Link} to="/">Home</Anchor>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);

          return isLast ? (
            <span key={to}>{formattedValue}</span>
          ) : (
            <Anchor key={to} href={to}>{formattedValue}</Anchor>
          );
        })}
      </Breadcrumbs>
      </div>
    );
  }

  return (
    <>
      <div className={styles.app}>
          <div className={styles.router_inner}>
            <header className={styles.header}>
              <div className={styles.header_inner}>
                <img className={styles.logo} src={LogoImg} />
                <div className={styles.navbar}>
                  <div className={styles.navlinks_left}>
                    <Button component={Link} to="/" variant="subtle" color="black">Books</Button>
                    <Button component={Link} to="/loans" variant="subtle" color="black">Loans</Button>
                    <Button component={Link} to="/statistics" variant="subtle" color="black">Statistics</Button>
                  </div>
                  {isAuth ?
                    <Popover trapFocus position="bottom" withArrow shadow="md">
                      <Popover.Target>
                        <Button variant="outline">{name}</Button>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <Button loading={isLogoutingFetch} onClick={logout} rightSection={<IconLogout />}>Log out</Button>
                      </Popover.Dropdown>
                    </Popover>
                    :
                    <Button loading={isAuthFetch} rightSection={<IconLogin2 />} variant="default" component={Link} to="/login">
                      Log in
                    </Button>
                  }
                </div>
              </div>
            </header>
            <BreadcrumbsNav />
            <div className={styles.content_wrap}>
            <div className={styles.content}>
              <Routes>
                <Route path="/" element={<Books />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </div>
            </div>
            <footer className={styles.footer}>
              <div className={styles.footer_inner}>
                <div className={styles.navlinks_left}>
                  <Button classNames={{
                    root: styles.navlink_footer,
                  }} component={Link} to="/books" variant="subtle" color="white">Books
                  </Button>
                  <Button
                    classNames={{
                      root: styles.navlink_footer,
                    }} component={Link} to="/loans" variant="subtle" color="white">Loans
                  </Button>
                  <Button
                    classNames={{
                      root: styles.navlink_footer,
                    }} component={Link} to="/statistics" variant="subtle" color="white">Statistics
                  </Button>
                </div>
                <img className={styles.logo} src={LogoImgWhite} />
              </div>
            </footer>
          </div>
      </div>
    </> 
  )
}

export default App
