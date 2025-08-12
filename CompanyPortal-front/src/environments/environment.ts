interface Environment {
  production: boolean;
  apiUrl: string;
  logging: boolean;

}

export const environment:Environment = {
  production: false,
  apiUrl: 'https://localhost:7106/',
  logging: true,
};
