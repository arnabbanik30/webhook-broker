export const dummyPoster = async (url: any, payload: any): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const randomBoolean = Math.random() < 0.5;
        resolve(randomBoolean);
      }, 1000); 
    });
  };
