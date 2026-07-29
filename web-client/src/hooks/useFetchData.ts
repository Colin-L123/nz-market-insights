import { useState, useEffect } from "react";

export default function useFetchData<T>(fetchFn: () => Promise<T[]>){
    const [data, setData] = useState<T[]>([])
    useEffect(() => {fetchFn().then(setData).catch(err => console.error(err))},[])
    return data
}