import { createServer } from 'vite'

const ports = [5173, 5174, 5175, 5176, 5177]
const hosts = ports.map((_, index) => `127.0.0.${index + 1}`)
const servers = []

try {
  for (const [index, port] of ports.entries()) {
    const server = await createServer({
      server: {
        host: '0.0.0.0',
        port,
        strictPort: false,
        allowedHosts: hosts,
      },
    })
    await server.listen()
    servers.push(server)
    const address = server.httpServer?.address()
    const actualPort = typeof address === 'object' && address ? address.port : port
    console.log(`User ${index + 1}: http://${hosts[index]}:${actualPort}`)
  }

  await new Promise((resolve) => {
    process.once('SIGINT', resolve)
    process.once('SIGTERM', resolve)
  })
} finally {
  await Promise.all(servers.map((server) => server.close()))
}
