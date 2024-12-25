import { notifications } from '@mantine/notifications';

const handleError = (dispatch, err) => {
    if(window.navigator.onLine) {
        switch (err.response.status) {
            case 500:
                notifications.show({
                    color: "red",
                    title: 'Server error',
                    position: "bottom-center",
                })
                break
            default:
                notifications.show({
                    color: "red",
                    title: 'Unknown error',
                    position: "bottom-center",
                })
                break
        }
    } else {
        dispatch(toast("secondary", "Internet disconnected"))
    }
}

export default handleError