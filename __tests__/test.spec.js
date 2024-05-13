const request = require("supertest");
const supertest = require('supertest-session');
const {app} = require("../app.js");
const prisma = require("./../src/utils/prisma.js");


describe('GET routes', () => {
    test('GET / should return code 200', async () => {
        const response = await request(app).get('/')
        expect(response.statusCode).toBe(200);
    });
    test('GET /signup should return code 200', async () => {
        const response = await request(app).get('/signup')
        expect(response.statusCode).toBe(200);
    });
    test('GET /login should return code 200', async () => {
        const response = await request(app).get('/login')
        expect(response.statusCode).toBe(200);
    });
});

describe('Authentication tests', () => {
    beforeAll(async () => {
        await prisma.$connect()
    })
    afterAll(async () => {
        await prisma.$disconnect()
    })
    test('It should create a new user and redirect to login page', async () => {
        const response = await request(app)
            .post('/signup')
            .send({email: 'test@example.com', password: 'password', name: 'Test User'});
        expect(response.statusCode).toBe(302); // Expecting a redirect status code
        expect(response.header.location).toBe('/login'); // Expecting redirect to login page
    });
    test('It should not be able to login with wrong password', async () => {
        const response = await request(app)
            .post('/login')
            .send({email: 'test@example.com', password: 'password1'});
        expect(response.statusCode).toBe(302); // Expecting a redirect status code
        expect(response.header.location).toBe('/login'); // Expecting redirect to main page
    });
    test('It should not be able to login with wrong email', async () => {
        const response = await request(app)
            .post('/login')
            .send({email: 'test1@example.com', password: 'password'});
        expect(response.statusCode).toBe(302); // Expecting a redirect status code
        expect(response.header.location).toBe('/login'); // Expecting redirect to main page
    });
    test('It should be able to login with user created', async () => {
        const response = await request(app)
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});
        expect(response.statusCode).toBe(302); // Expecting a redirect status code
        expect(response.header.location).toBe('/'); // Expecting redirect to main page
    });

    test('It should not be able to create a new user with same email', async () => {
        const response = await request(app)
            .post('/signup')
            .send({email: 'test@example.com', password: 'password1', name: 'Test1 User'});
        expect(response.statusCode).toBe(302); // Expecting a redirect status code
        expect(response.header.location).toBe('/signup'); // Expecting redirect to signup page
    });

});

describe('Posts Tests', () => {
    beforeAll(async () => {
        await prisma.$connect()
    })
    afterAll(async () => {
        await prisma.$disconnect()
    })
    test('It should render the homepage with correct data', async () => {

        const page = 1;
        const sortOption = undefined;
        const tagFilter = undefined;
        const perPage = 3
        const offset = (page - 1) * perPage;


        const response = await request(app)
            .get('/')
            .query({page: page, sortOption: sortOption, tagFilter: tagFilter});

        // Verify the response status code
        expect(response.status).toBe(200);

        let posts = await prisma.post.findMany({
            include: {author: true, tags: true},
            orderBy: {
                createdAt: sortOption === 'createdAtAsc' ? 'asc' : 'desc'
            },
            where: {
                tags: tagFilter ? {some: {name: {contains: tagFilter}}} : undefined
            },
            skip: offset,
            take: perPage
        });

        posts.forEach((post) => {
            expect(response.text).toContain(post.title);
            expect(response.text).toContain(post.content);
        });

    });
    test('GET /post should return code 401 (no login)', async () => {
        const response = await request(app).get('/post')
        expect(response.statusCode).toBe(401);
    });
    test('GET /post should return code 200 (login)', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});

        const response = await session.get('/post')
        expect(response.statusCode).toBe(200);
    });
    test('GET /post/:id should return code 404 (id does not exist) ', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});

        const response = await session.get('/post/1')
        expect(response.statusCode).toBe(404);
    });
    test('GET /post/:id should return code 403 (id is ok, but not his post) ', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});

        const response = await session.get('/post/4')
        expect(response.statusCode).toBe(403);
    });
    test('Create post ', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});

        const reqBody = {
            title: 'Test Post',
            tags: 'test tag',
            type: 'TEXT',
            content: 'Test Content',
        };
        const response = await session.post('/post').send(reqBody);

        expect(response.statusCode).toBe(302);
        expect(response.header.location).toBe('/');
    });

    test('Create post validation err title ', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});

        const reqBody = {
            title: 'T',
            tags: 'tes',
            type: 'TEXT',
            content: 'Test Content',
        };
        const response = await session.post('/post').send(reqBody);

        expect(response.statusCode).toBe(500);
    });
    test('Get /post/:id should return code 200 for modify (id is ok) ', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});
        const user = await prisma.user.findUnique({where: {email: 'test@example.com'}});
        if (user) {
            const post = await prisma.post.findFirst({where: {authorId: user.id}});
            const response = await session.get(`/post/${post.id}`)
            expect(response.statusCode).toBe(200);
        }
    });

    test('Edit post ', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});

        const reqBody = {
            title: 'Test edit Post',
            tags: 'test edit tag',
            type: 'TEXT',
            content: 'Test edit Content',
        };
        const user = await prisma.user.findUnique({where: {email: 'test@example.com'}});
        if (user) {
            const post = await prisma.post.findFirst({where: {authorId: user.id}});

            const response = await session.put(`/post/${post.id}`).send(reqBody);

            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe('/');

        }
    });

    test('Delete post ', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});


        const user = await prisma.user.findUnique({where: {email: 'test@example.com'}});
        if (user) {
            const post = await prisma.post.findFirst({where: {authorId: user.id}});

            const response = await session.delete(`/post/${post.id}`);

            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe('/');

        }
    });
    test('Delete inexistent post ', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});


        const response = await session.delete(`/post/-1`);

        expect(response.statusCode).toBe(404);


    });
    test('Delete post but not author', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});


        const response = await session.delete(`/post/4`);

        expect(response.statusCode).toBe(403);

    });
});

//
// describe('Comments Tests', () => {
//
//     beforeAll(async () => {
//         await prisma.$connect()
//     })
//     afterAll(async () => {
//         await prisma.$disconnect()
//     })
//     test('It should render the comments', async () => {
//
//
//         const response = await request(app)
//             .get('/')
//             .query({page: page, sortOption: sortOption, tagFilter: tagFilter});
//
//         // Verify the response status code
//         expect(response.status).toBe(200);
//
//         let posts = await prisma.post.findMany({
//             include: {author: true, tags: true},
//             orderBy: {
//                 createdAt: sortOption === 'createdAtAsc' ? 'asc' : 'desc'
//             },
//             where: {
//                 tags: tagFilter ? {some: {name: {contains: tagFilter}}} : undefined
//             },
//             skip: offset,
//             take: perPage
//         });
//
//         posts.forEach((post) => {
//             expect(response.text).toContain(post.title);
//             expect(response.text).toContain(post.content);
//         });
//
//     });
//     test('GET /post should return code 401 (no login)', async () => {
//         const response = await request(app).get('/post')
//         expect(response.statusCode).toBe(401);
//     });
//     test('GET /post should return code 200 (login)', async () => {
//         const session = supertest(app);
//         await session
//             .post('/login')
//             .send({email: 'test@example.com', password: 'password'});
//
//         const response = await session.get('/post')
//         expect(response.statusCode).toBe(200);
//     });
//     test('GET /post/:id should return code 404 (id does not exist) ', async () => {
//         const session = supertest(app);
//         await session
//             .post('/login')
//             .send({email: 'test@example.com', password: 'password'});
//
//         const response = await session.get('/post/1')
//         expect(response.statusCode).toBe(404);
//     });
//     test('GET /post/:id should return code 403 (id is ok, but not his post) ', async () => {
//         const session = supertest(app);
//         await session
//             .post('/login')
//             .send({email: 'test@example.com', password: 'password'});
//
//         const response = await session.get('/post/4')
//         expect(response.statusCode).toBe(403);
//     });
//     test('Create post ', async () => {
//         const session = supertest(app);
//         await session
//             .post('/login')
//             .send({email: 'test@example.com', password: 'password'});
//
//         const reqBody = {
//             title: 'Test Post',
//             tags: 'test tag',
//             type: 'TEXT',
//             content: 'Test Content',
//         };
//         const response = await session.post('/post').send(reqBody);
//
//         expect(response.statusCode).toBe(302);
//         expect(response.header.location).toBe('/');
//     });
//
//     test('Create post validation err title ', async () => {
//         const session = supertest(app);
//         await session
//             .post('/login')
//             .send({email: 'test@example.com', password: 'password'});
//
//         const reqBody = {
//             title: 'T',
//             tags: 'tes',
//             type: 'TEXT',
//             content: 'Test Content',
//         };
//         const response = await session.post('/post').send(reqBody);
//
//         expect(response.statusCode).toBe(500);
//     });
//     test('Get /post/:id should return code 200 for modify (id is ok) ', async () => {
//         const session = supertest(app);
//         await session
//             .post('/login')
//             .send({email: 'test@example.com', password: 'password'});
//         const user = await prisma.user.findUnique({where: {email: 'test@example.com'}});
//         if (user) {
//             const post = await prisma.post.findFirst({where: {authorId: user.id}});
//             const response = await session.get(`/post/${post.id}`)
//             expect(response.statusCode).toBe(200);
//         }
//     });
//
//     test('Edit post ', async () => {
//         const session = supertest(app);
//         await session
//             .post('/login')
//             .send({email: 'test@example.com', password: 'password'});
//
//         const reqBody = {
//             title: 'Test edit Post',
//             tags: 'test edit tag',
//             type: 'TEXT',
//             content: 'Test edit Content',
//         };
//         const user = await prisma.user.findUnique({where: {email: 'test@example.com'}});
//         if (user) {
//             const post = await prisma.post.findFirst({where: {authorId: user.id}});
//
//             const response = await session.put(`/post/${post.id}`).send(reqBody);
//
//             expect(response.statusCode).toBe(302);
//             expect(response.header.location).toBe('/');
//
//         }
//     });
//
//     test('Delete post ', async () => {
//         const session = supertest(app);
//         await session
//             .post('/login')
//             .send({email: 'test@example.com', password: 'password'});
//
//
//         const user = await prisma.user.findUnique({where: {email: 'test@example.com'}});
//         if (user) {
//             const post = await prisma.post.findFirst({where: {authorId: user.id}});
//
//             const response = await session.delete(`/post/${post.id}`);
//
//             expect(response.statusCode).toBe(302);
//             expect(response.header.location).toBe('/');
//
//         }
//     });
//     test('Delete inexistent post ', async () => {
//         const session = supertest(app);
//         await session
//             .post('/login')
//             .send({email: 'test@example.com', password: 'password'});
//
//
//         const response = await session.delete(`/post/-1`);
//
//         expect(response.statusCode).toBe(404);
//
//
//     });
//     test('Delete post but not author', async () => {
//         const session = supertest(app);
//         await session
//             .post('/login')
//             .send({email: 'test@example.com', password: 'password'});
//
//
//         const response = await session.delete(`/post/4`);
//
//         expect(response.statusCode).toBe(403);
//
//     });
// });


describe('User Tests', () => {
    beforeAll(async () => {
        await prisma.$connect()

    })
    afterAll(async () => {
        await prisma.$disconnect()
    })
    test('Admin route ok', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'admin@gmail.com', password: '1234567890'});
        const response = await session.get('/users');
        expect(response.statusCode).toBe(200);
    });
    test('Admin route not ok', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});
        const response = await session.get('/users');
        expect(response.statusCode).toBe(401);
    });
    test('GET profile', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});
        const user = await prisma.user.findUnique({where: {email: 'test@example.com'}});
        if (user) {
            const response = await session.get(`/user/${user.id}`);
            expect(response.statusCode).toBe(200);
        }
    });
    test('try to get edit form for his own profile', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});
        const user = await prisma.user.findUnique({where: {email: 'test@example.com'}});
        if (user) {
            const response = await session.get(`/user/editProfile/${user.id}`);
            expect(response.statusCode).toBe(200);
        }
    });
    test('try to edit  his own profile', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});
        const user = await prisma.user.findUnique({where: {email: 'test@example.com'}});
        if (user) {
            const reqBody = {
                name: 'edited name',
                email: user.email,
                bio: 'edited bio',
            };
            const response = await session.put(`/user/${user.id}`).send(reqBody);
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe(`/user/${user.id}`);
        }
    });

    test('GET wrong profile', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});
        const user = await prisma.user.findUnique({where: {email: 'test@example.com'}});
        if (user) {
            const response = await session.get(`/user/53`);
            expect(response.statusCode).toBe(403);
        }
    });
    test('try to get edit form for another profile', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});

        const response = await session.get(`/user/editProfile/53`);
        expect(response.statusCode).toBe(403);

    });
    test('try to  edit  another profile', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});
        const reqBody = {
            name: 'addmin',
            email: 'newemail@email.com',
            bio: 'edited bio',
        };
        const response = await session.put(`/user/53`).send(reqBody);
        expect(response.statusCode).toBe(403);

    });
    test('try to edit  his own email profile', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'test@example.com', password: 'password'});
        const user = await prisma.user.findUnique({where: {email: 'test@example.com'}});
        if (user) {
            const reqBody = {
                name: user.name,
                email: 'newemail@email.com',
                bio: 'new bio',
            };
            const response = await session.put(`/user/${user.id}`).send(reqBody);
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe(`/user/${user.id}`);


        }
    });
    test('try to delete another user', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'newemail@email.com', password: 'password'});

        const response = await session.delete(`/user/159`)
        expect(response.statusCode).toBe(401);

    });
    test('delete user', async () => {
        const session = supertest(app);
        await session
            .post('/login')
            .send({email: 'newemail@email.com', password: 'password'});
        const user = await prisma.user.findUnique({where: {email: 'newemail@email.com'}});
        if (user) {
            const response = await session.delete(`/user/${user.id}`)
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe('/logout');
        }
    });
});