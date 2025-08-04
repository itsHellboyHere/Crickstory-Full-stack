import { Metadata } from 'next'
import React from 'react'
import { FaSearch } from 'react-icons/fa'
import styles from "@/app/css/Search.module.css"
import SearchComponent from '@/app/components/SearchComponent'
export const metadata: Metadata = {
    title: "Search",
    description: "Search Your favourite users.",
}
export default async function Search() {
    return (
        <main className='max-w-xl mx-auto p-6'>

            <SearchComponent />

        </main>
    )
}