import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret-dev-key";

export const signToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// Decorator para proteger rotas
export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: "Token not provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Injeta o ID do usuário na requisição
    request.user = { id: decoded.userId };
  } catch (err) {
    return reply.status(401).send({ error: "Invalid token" });
  }
};

// Extensão de tipagem para o Fastify
declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
    };
  }
}
