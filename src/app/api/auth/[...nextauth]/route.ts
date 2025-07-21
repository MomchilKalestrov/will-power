import NextAuth from 'next-auth';

const authOptions = {

};

const handler = NextAuth({
    providers: [

    ]
});

export { handler as GET, handler as POST, authOptions };