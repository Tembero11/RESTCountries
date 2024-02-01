import { Box, Center, HStack, Heading, Spinner, Text, Image, VStack } from "@chakra-ui/react";
import 'leaflet/dist/leaflet.css';
import humanFormat from "human-format";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useParams } from "react-router-dom";

// Contains only the required fields from the api
interface ICountryInfo {
    name: {
        common: string;
        official: string;
    };
    subregion: string;
    currencies: {
        [key: string]: { name: string, symbol: string }
    }
    population: number;
    flags: {
        svg: string;
        png: string;
        alt: string;
    }
    latlng: number[]
}

export default function CountryPage() {
    const [countryInfo, setCountryInfo] = useState<null | ICountryInfo>(null);

    const { countryName } = useParams();

    useEffect(() => {
        async function fetchCountries() {
            const url = `https://restcountries.com/v3.1/name/${countryName}?fullText=true&fields=name,subregion,population,flags,currencies,latlng`;
            const res = await fetch(url, {
                method: "get"
            });

            if (!res.ok) {
                return null;
            }

            // Array of countries, in this case always has one country
            const country = await res.json();

            return country[0];
        }
        fetchCountries().then(result => setCountryInfo(result));
    }, []);

    if (!countryInfo) {
        return (
            <Center h="100vh">
                <Spinner size="xl" />
            </Center>
        )
    }

    return (
        <VStack justifyContent="space-between" alignItems="center" w="100vw" h="100vh" pt={8} gap={2}>
            <HStack gap={4}>
                <Image src={countryInfo.flags.svg} boxShadow="8px 8px 16px #bebebe" w={100} alt={countryInfo.flags.alt} />
                <Heading as="h1" size="xl">{countryInfo.name.common}</Heading>
            </HStack>
            <Heading as="h2" size="md">{countryInfo.name.official}</Heading>
            <HStack px={6}>
                <Text>{countryInfo.subregion}</Text>
                <Box borderRadius="100px" w={2} h={2} bgColor={"gray"}></Box>
                <Text>Population {humanFormat(countryInfo.population)}</Text>
                <Box borderRadius="100px" w={2} h={2} bgColor={"gray"}></Box>
                <Text>{Object.values(countryInfo.currencies).map(({ name, symbol }) => `${name} (${symbol})`).join(", ")}</Text>
            </HStack>
            <MapContainer style={{flex: 1, width: "100vw"}} center={countryInfo.latlng} zoom={5}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </MapContainer>
        </VStack>
    );
}