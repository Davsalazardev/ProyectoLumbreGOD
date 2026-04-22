FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src


COPY *.sln .
COPY *.csproj ./
RUN dotnet restore "JuegoMultijugador.csproj"


COPY . .
RUN dotnet publish "JuegoMultijugador.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./


ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "JuegoMultijugador.dll"]
