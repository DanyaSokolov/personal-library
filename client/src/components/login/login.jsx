import React, { useState } from 'react';
import { Input, Checkbox, Button, rem, Paper  } from '@mantine/core';
import { apiLogin, apiIsUser } from '../../store/slices/authSlice';
import { useDispatch, useSelector } from "react-redux"

import styles from './login.module.scss';
import { useNavigate } from 'react-router-dom';
import { IconExclamationCircle, IconLogin2 } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { unwrapResult } from '@reduxjs/toolkit';

const useLocalState = () => {

    const dispatch = useDispatch()

    const dispatchApiLogin = async (form) => {
        return dispatch(apiLogin(form))
    }

    const dispatchApiIsUser = async () => {
        return dispatch(apiIsUser())
    }

    const {
        connection: { isLoginingFetch }
     } = useSelector((state) => state.auth);
 
    const [form, setForm] = useState({
        remember: false
    })
    const [errors, setErrors] = useState({})

    const setField = (field, value) => {
        setForm({
            ...form,
            [field]: value
        });

        const fieldErrors = validateField(field, value);

        setErrors({
            ...errors,
            [field]: fieldErrors[field]
        });
    }

    const validateField = (field, value) => {
        const newError = {};

        switch (field) {
            case 'name':
                if (value == undefined || value == '') newError.name = 'Please enter name'
                else if (value && value.length < 4) newError.name = `Name must be more than 4 characters.`
                else if (value && value.length > 16) newError.name = `Name must be less than 16 characters.`
                break;
            case 'password':
                if (value == undefined || value == '') newError.password = 'Please enter password'
                else if (value && value.length < 4) newError.password = `Password must be more than 4 characters.`
                else if (value && value.length > 16) newError.password = `Password must be less than 16 characters.`
                break;
        }

        return newError;
    }

    const validateForm = () => {
        const newErrors = {};

        const fields = ['name', 'password'];

        fields.forEach(field => {
            const fieldErrors = validateField(field, form[field]);
            Object.assign(newErrors, fieldErrors);
        });

        return newErrors;
    }

    const navigate = useNavigate()

    const handleSubmit = async () => {

        const formErrors = validateForm()

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors)
            notifications.show({
                color: "yellow",
                title: 'Invalid form',
                position: "bottom-center",
            })
        } else {
           const actionRes = await dispatchApiLogin(form)
           const promiseRes = unwrapResult(actionRes) 

           console.log(promiseRes)

            switch (promiseRes.status) { 
                case "incorrect_name": 
                    setErrors({name: 'Incorrect name'})
                    notifications.show({
                        color: "red",
                        title: 'Incorrect name',
                        position: "bottom-center",
                    })
                    break
                case "incorrect_password": 
                setErrors({password: 'Inorrect password'})
                    notifications.show({
                        color: "red",
                        title: 'Incorrect password',
                        position: "bottom-center",
                    })
                    break
                case "success": 
                    await dispatchApiIsUser()
                    navigate("/") 
            }
        } 
    }

    return { form, errors, setField, handleSubmit, isLoginingFetch }
}

const Login = () => {

    const { form, errors, setField, handleSubmit, isLoginingFetch } = useLocalState()

    return (
        <Paper className={styles.form_wrap} shadow="sm" withBorder radius="lg">
        <form className={styles.form}>
            <h2 className={styles.title}>Log in</h2>
            <Input.Wrapper className={styles.input_wrap} label="Name" error={errors.name}>
                <Input className={styles.input} placeholder="Enter name" 
                    value={form.name}
                    onChange={e => setField('name', e.target.value)} 
                    rightSection={errors.name &&
                        <IconExclamationCircle
                          style={{ width: rem(20), height: rem(20) }}
                          color="var(--mantine-color-error)"
                        />
                      }
                    />
            </Input.Wrapper>
            <Input.Wrapper className={styles.input_wrap} label="Password" error={errors.password}>
                <Input className={styles.input} placeholder="Enter password" 
                value={form.password}
                onChange={e => setField('password', e.target.value)}
                rightSection={errors.password &&
                    <IconExclamationCircle
                      style={{ width: rem(20), height: rem(20) }}
                      color="var(--mantine-color-error)"
                    />
                  } />
            </Input.Wrapper>
            <Checkbox
                value={form.remember}
                onChange={e => setField('remember', e.target.checked)} 
                className={styles.checkbox}
                label="Remember me"
            />
            <Button rightSection={<IconLogin2 />} loading={isLoginingFetch} onClick={handleSubmit} className={styles.btn} variant="filled">Log in</Button>
        </form>  
        </Paper>
    );
};

export default Login;