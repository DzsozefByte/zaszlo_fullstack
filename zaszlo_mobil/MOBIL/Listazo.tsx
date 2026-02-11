//React Native-ben NINCS IntersectionObserver → FlatList.onEndReached-et kell használni.
import React, { useEffect, useState } from 'react';
import {View, Text, Image, Button, ActivityIndicator, FlatList, StyleSheet} from 'react-native';
import axios from 'axios';

type Termek = {
  id: number;
  termek: string;
  ar: number;
  kepnev: string;
};

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const PAGE_SIZE = 10;

const ListazoInfinite = () => {
  const [data, setData] = useState<Termek[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPage(1);
  }, []);

  const loadPage = async (pageNum: number, refresh = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<Termek[]>(
        `${backendUrl}/termekek`,
        {
          params: {
            page: pageNum,
            //limit: PAGE_SIZE,
          },
          timeout: 5000,
        }
      );

      const newData = response.data;

      if (newData.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setData((prev) =>
        refresh ? newData : [...prev, ...newData]
      );

      setPage(pageNum);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('❌ Nem érhető el a backend szerver');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadPage(page + 1);
    }
  };

  const refreshList = () => {
    setHasMore(true);
    loadPage(1, true);
  };

  // ❌ Hiba képernyő
  if (error && data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Újrapróbálás" onPress={refreshList} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.htext}>Terméklista</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>
              {item.id}. {item.termek}
            </Text>

            <Image
              source={{ uri: `${backendUrl}/images/${item.kepnev}` }}
              style={styles.image}
            />

            <Text style={styles.price}>Ár: {item.ar} Ft</Text>

            <Button
              title="Kosárba"
              onPress={() => console.log('Kosárba:', item.termek)}
            />
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={loading && page === 1}
        onRefresh={refreshList}
        ListFooterComponent={
          loading && page > 1 ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : !hasMore ? (
            <Text style={styles.endText}>Nincs több termék</Text>
          ) : null
        }
      />
    </View>
  );
};

export default ListazoInfinite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  htext: {
    fontSize: 24,
    color: 'yellow',
    marginVertical: 10,
    textAlign: 'center',
  },
  item: {
    margin: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    color: 'black',
  },
  price: {
    fontSize: 16,
    marginVertical: 5,
  },
  image: {
    height: 200,
    resizeMode: 'contain',
    marginVertical: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  endText: {
    textAlign: 'center',
    color: 'gray',
    marginVertical: 20,
  },
});
