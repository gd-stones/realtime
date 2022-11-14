import axios from 'axios'

export const getData = async (url) => {
    const res = await axios.get(url)
    return res;
}

export const patchData = async (url) => {
    const res = await axios.patch(url)
    return res;
}