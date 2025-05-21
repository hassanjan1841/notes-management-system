import prisma from '../src/config/db.js'; // Adjusted path for seed script
import bcrypt from 'bcryptjs';

async function main() {
    console.log('Start seeding ...');

    // Create 5 Dummy Users
    const usersData = [];
    for (let i = 1; i <= 5; i++) {
        const hashedPassword = await bcrypt.hash(`password${i}`, 10);
        usersData.push({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            password: hashedPassword,
        });
    }
    const users = [];
    for (const uData of usersData) {
        const user = await prisma.user.create({ data: uData });
        users.push(user);
        console.log(`Created user with id: ${user.id}`);
    }

    // Create 20-30 Dummy Notes, assigned to different users
    const notesData = [];
    const numNotes = Math.floor(Math.random() * (30 - 20 + 1)) + 20; // Random number between 20 and 30

    for (let i = 1; i <= numNotes; i++) {
        const randomUserIndex = Math.floor(Math.random() * users.length);
        const notePassword = i % 5 === 0 ? `notePass${i}` : null; // Every 5th note is password protected

        notesData.push({
            title: `Note Title ${i}`,
            description: `This is the description for note ${i}. It belongs to ${users[randomUserIndex].name}.`,
            password: notePassword,
            userId: users[randomUserIndex].id,
        });
    }

    for (const nData of notesData) {
        const note = await prisma.note.create({ data: nData });
        console.log(`Created note with id: ${note.id} for user ${note.userId}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 