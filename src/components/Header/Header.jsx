import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import userSvg from '../../assets/user.svg'

const Header = () => {
    const [user] = useAuthState(auth);
    const navigate = useNavigate();
    function logout() {
        auth.signOut();
        navigate("/");
    }

    useEffect(() => {
        if (!user) {
        navigate("/");
        } else {
        navigate("/dashboard");
        }
    }, [user, navigate]);
  return (
    <div className="sticky w-full px-6 py-3 bg-[var(--theme)] flex justify-between items-center">
        <p className="text-white font-medium text-[1.2rem] m-0">MoneyMap.</p>
        {user ? (
            <p
            className="text-[#e3e3e3] font-medium text-base m-0 cursor-pointer hover:text-white transition-all duration-300 flex items-center"
            onClick={logout}
            >
            <span className="mr-4">
                <img
                src={user.photoURL ? user.photoURL : userSvg}
                width={user.photoURL ? "32" : "24"}
                className="rounded-full"
                />
            </span>
            Logout
            </p>
        ) : (
            <></>
        )}
    </div>

  )
}

export default Header