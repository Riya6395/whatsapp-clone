import getPrismaInstance from "../utils/PrismaClient.js";
import { generateToken04 } from "../utils/TokenGenerator.js";

export const checkUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ msg: "Email not found", status: false });

    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({ where: { email } });

    // console.log("Checking user", email);
    if (!user) {
      return res.json({ msg: "User not found", status: false });
    } else {
      return res.json({ msg: "User exists", status: true, data: user });
    }
  } catch (error) {
    next(error);
  }
};

export const onBoardUser = async (req, res, next) => {
  try {
    const { email, name, about, image: profilePicture } = req.body;
    if (!email || !name || !profilePicture) {
      res.send("required parameters not filled.");
    }
    const prisma = getPrismaInstance();
    const user = await prisma.user.create({
      data: { email, name, profilePicture, about },
    });
    return res.json({ msg: "Success", status: 200, user });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        about: true,
      },
    });
    const usersGroupByIntialLetter = {};
    users.forEach((user) => {
      const intailLetter = user.name.charAt(0).toUpperCase();
      if (!usersGroupByIntialLetter[intailLetter]) {
        usersGroupByIntialLetter[intailLetter] = [];
      }
      usersGroupByIntialLetter[intailLetter].push(user);
    });
    return res.status(200).send({ users: usersGroupByIntialLetter });
  } catch (error) {
    next(error);
  }
};

export const generateToken = (req, res, next) => {
  try {
    // console.log(process.env.ZEGO_APP_ID)
    // console.log(process.env.ZEGO_APP_SECRET)
    const appId = parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = (process.env.ZEGO_APP_SECRET);
    const userId = req.params.userId;
    const effectiveTime = 3600;
    const payload = "";

    if (appId && serverSecret && userId) {
      const token = generateToken04(
        appId,
        userId,
        serverSecret,
        effectiveTime,
        payload
      );
      res.status(200).json({ token });
    }
    res.status(400).send("user id ,app id ,and secret reqired");
  } catch (error) {
    next(error);
  }
};
