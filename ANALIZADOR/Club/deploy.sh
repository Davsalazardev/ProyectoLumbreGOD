
set -e

echo "=========================================="
echo "Deploy Juego Multiplayer a DigitalOcean"
echo "=========================================="


REPO_DIR="/root/juego"
PORT=5000
HOST_PORT=80


echo "[1/5] Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker root
fi


echo "[2/5] Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi


echo "[3/5] Entrando al directorio del proyecto..."
cd "$REPO_DIR"


echo "[4/5] Construyendo la imagen Docker (esto puede tomar varios minutos)..."
sudo docker-compose build --no-cache


echo "[5/5] Iniciando el contenedor..."
sudo docker-compose down || true
sudo docker-compose up -d


sleep 3
if sudo docker ps | grep -q juego-multiplayer; then
    echo ""
    echo "=========================================="
    echo "✅ Deploy completado exitosamente"
    echo "=========================================="
    echo "El servidor está corriendo en:"
    echo "  http://$(hostname -I | awk '{print $1}'):${HOST_PORT}"
    echo ""
    echo "Para ver los logs:"
    echo "  sudo docker-compose logs -f"
    echo ""
    echo "Para detener el servidor:"
    echo "  cd $REPO_DIR && sudo docker-compose down"
    echo "=========================================="
else
    echo "❌ Error: El contenedor no está corriendo"
    sudo docker-compose logs
    exit 1
fi
