import { redirect } from 'next/navigation';

const NotFound = () => redirect('/admin/home');

export default NotFound;