import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const initialItems = [
  {
    code: "BR001",
    name: "Laptop Lenovo",
    category: "Laptop",
    stock: 5,
    minStock: 2,
    description: "Laptop untuk praktikum dan kegiatan laboratorium.",
  },
  {
    code: "BR002",
    name: "Mouse Logitech",
    category: "Aksesoris",
    stock: 10,
    minStock: 3,
    description: "Mouse USB optik untuk workstation laboratorium.",
  },
  {
    code: "BR003",
    name: "Keyboard Mechanical",
    category: "Aksesoris",
    stock: 8,
    minStock: 3,
    description: "Keyboard mechanical dengan koneksi USB.",
  },
  {
    code: "BR004",
    name: "Proyektor Epson",
    category: "Proyektor",
    stock: 3,
    minStock: 1,
    description: "Proyektor portabel untuk presentasi dan kelas.",
  },
  {
    code: "BR005",
    name: "Monitor LG",
    category: "Monitor",
    stock: 6,
    minStock: 2,
    description: "Monitor LED 24 inci untuk lab komputer.",
  },
  {
    code: "BR006",
    name: "Kabel HDMI",
    category: "Kabel & Adaptor",
    stock: 12,
    minStock: 4,
    description: "Kabel HDMI 2 meter untuk proyektor dan monitor.",
  },
  {
    code: "BR007",
    name: "Switch TP-Link 8 Port",
    category: "Jaringan",
    stock: 4,
    minStock: 1,
    description: "Network switch 8 port untuk praktikum jaringan.",
  },
  {
    code: "BR008",
    name: "Router MikroTik",
    category: "Jaringan",
    stock: 3,
    minStock: 1,
    description: "Router untuk modul praktikum konfigurasi jaringan.",
  },
  {
    code: "BR009",
    name: "Webcam Logitech C920",
    category: "Aksesoris",
    stock: 5,
    minStock: 2,
    description: "Webcam full HD untuk kelas daring dan webinar.",
  },
  {
    code: "BR010",
    name: "Printer Canon LBP",
    category: "Printer",
    stock: 2,
    minStock: 1,
    description: "Printer laser monokrom untuk kebutuhan administrasi.",
  },
];

async function main() {
  const adminPassword = await hash("admin123", 10);
  const staffPassword = await hash("staff123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      name: "Administrator Laboratorium",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      name: "Administrator Laboratorium",
      username: "admin",
      email: "admin@labinventory.local",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { username: "staff" },
    update: {
      name: "Budi Santoso",
      passwordHash: staffPassword,
      role: Role.STAFF,
      isActive: true,
    },
    create: {
      name: "Budi Santoso",
      username: "staff",
      email: "staff@labinventory.local",
      passwordHash: staffPassword,
      role: Role.STAFF,
    },
  });

  for (const item of initialItems) {
    await prisma.item.upsert({
      where: { code: item.code },
      update: {},
      create: item,
    });
  }

  console.log("Seed selesai: 2 akun demo dan 10 data barang siap digunakan.");
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
