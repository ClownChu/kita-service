import WebSocket from 'ws';

export default abstract class KitaService {  
  protected name;
  public get Name(): string {
    return this.name;
  }

  protected port;
  public get Port(): number {
    return this.port;
  }

  private server?: WebSocket.Server;
  public get Server(): WebSocket.Server | undefined {
    return this.server;
  }

  private connections?: WebSocket[];
  public get Connections(): WebSocket[] | undefined {
    return this.connections;
  }
  
  constructor(name = `Kita Service`, port = 3000) {
    this.name = name;
    this.port = port;
  }

  public async start(): Promise<boolean> {
    const self = this;

    if (self.server !== undefined) {
      await self.stop();
    }

    console.log(`Starting ${self.Name} (pid: ${process.pid})`);

    try {
      self.beforeStart();
    } catch (err) {
      console.log(`   Error - ${err}`);
    }
    
    self.server = new WebSocket.Server({
      port: self.port
    });
    
    self.connections = [];
    self.server.on(`connection`, (connection) => {
      console.log(``);
      console.log(new Date().toLocaleString());

      self.connections?.push(connection);
      console.log(`   New connection (count = ${self.connections?.length})`);

      connection.on(`message`, (msg) => {
        console.log(``);
        console.log(new Date().toLocaleString());
        console.log(`   ${msg.toString()}`);
        
        const payload = JSON.parse(msg.toString());
        if (payload.action === `close`) {
          self.stop().then((result) => {
            if (!result) {
              process.exit(1);
            }
          });
        }

        try {
          self.onMessage(connection, msg);
        } catch (err) {
          console.log(`   Error - ${err}`);
        }
      });
  
      connection.on(`close`, () => {
        console.log(``);
        console.log(new Date().toLocaleString());

        self.connections = self.connections?.filter(s => s !== connection);
        console.log(`   Closed connection (count = ${self.connections?.length})`);
  
        try {
          self.onClose(connection);
        } catch (err) {
          console.log(`   Error - ${err}`);
        }
      });

      try {
        self.onConnection(connection);
      } catch (err) {
        console.log(`   Error - ${err}`);
      }
    });

    const serverAddress = self.server.address() as WebSocket.AddressInfo;
    console.log(`   -- Start time: ${new Date().toLocaleString()}`);
    console.log(`   -- Address: ${(serverAddress.address === `::` ? `127.0.0.1` : serverAddress.address)}:${serverAddress.port}`);
    console.log(`------------------------------------------`);

    return new Promise((resolve) => {
      try {
        self.afterStart();
      } catch (err) {
        console.log(`   Error - ${err}`);
      }

      resolve(true);
    });
  }

  public async stop(): Promise<boolean> {
    const self = this;

    try {
      self.beforeExit();
    } catch (err) {
      console.log(`   Error - ${err}`);
    }

    self.connections?.forEach((connection) => {
      connection.close(1000, `Service is stopping.`);
    });
    
    return new Promise((resolve) => {
      self.server?.close((err) => {
        if (err !== undefined) {
          resolve(false);
        }

        self.server = undefined;

        try {
          self.afterExit();
        } catch (err) {
          console.log(`   Error - ${err}`);
        }

        resolve(true);
      });
    });
  }

  abstract beforeStart(): void;
  abstract afterStart(): void;
  abstract beforeExit(): void;
  abstract afterExit(): void;
  abstract onConnection(connection: WebSocket): void;
  abstract onMessage(connection: WebSocket, msg: WebSocket.RawData): void;
  abstract onClose(connection: WebSocket): void;
}