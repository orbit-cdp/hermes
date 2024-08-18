import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/perps/long',
      permanent: false,
    },
  };
};

export default function Perps() {
  return null;
}
