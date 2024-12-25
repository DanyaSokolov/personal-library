import { unwrapResult } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setIsAuth } from "../store/slices/authSlice";
import { notifications } from '@mantine/notifications';

const useAuthRedirect = () => {

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const isAuthDispatch = async (action, data) => {

        const resultAction = await dispatch(data != undefined ? action(data) : action()); 
    
        if (action.fulfilled.match(resultAction)) {
            const responseData = unwrapResult(resultAction)
 
            if(responseData.status == "not_authorized") {
                dispatch(setIsAuth(false))
                notifications.show({
                    title: 'Not authorized',
                    message: 'Please, log in to see content',
                    position: "bottom-center",
                })
                navigate("/login"); 
            } 
        }
    
        return resultAction;
    };

    const isAuthLineDispatch = async (actions) => {

        for (const action of actions) {
            const result = await action();
            if (result.payload.status === "not_authorized") return; 
        }

    };

    return { isAuthDispatch, isAuthLineDispatch }; 
};

export default useAuthRedirect;