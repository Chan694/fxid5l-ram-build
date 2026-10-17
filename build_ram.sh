#!/usr/bin/env bash
set -euo pipefail
# Run on WSL2 Ubuntu / Linux, never on the router.
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKDIR="${WORKDIR:-$HOME/openwrt-fxid5l-ram-build}"
JOBS="${JOBS:-2}"
if [[ -e "$WORKDIR" && ! -d "$WORKDIR/.git" ]]; then
    echo "Not an OpenWrt source directory: $WORKDIR" >&2
    exit 1
fi
if [[ ! -e "$WORKDIR/.git" ]]; then
    git clone --depth=1 --branch=v25.12.5 https://github.com/openwrt/openwrt.git "$WORKDIR"
fi
cd "$WORKDIR"
./scripts/feeds update -a
./scripts/feeds install -a
mkdir -p files
cp -a "$HERE/files/." files/
cat > .config <<'CONFIG'
CONFIG_TARGET_ramips=y
CONFIG_TARGET_ramips_mt76x8=y
CONFIG_TARGET_DEVICE_ramips_mt76x8_DEVICE_zbtlink_zbt-we1226=y
CONFIG_TARGET_ROOTFS_INITRAMFS=y
CONFIG_TARGET_INITRAMFS_COMPRESSION_LZMA=y
CONFIG_PACKAGE_luci=y
CONFIG_PACKAGE_luci-ssl=y
CONFIG_PACKAGE_rpcd-mod-ucode=y
CONFIG_PACKAGE_swconfig=y
CONFIG_PACKAGE_socat=y
CONFIG_PACKAGE_picocom=y
CONFIG_PACKAGE_kmod-mii=y
CONFIG_PACKAGE_kmod-nls-base=y
CONFIG_PACKAGE_kmod-usb-common=y
CONFIG_PACKAGE_kmod-usb-core=y
CONFIG_PACKAGE_kmod-usb-ehci=y
CONFIG_PACKAGE_kmod-usb-ohci=y
CONFIG_PACKAGE_kmod-usb2=y
CONFIG_PACKAGE_kmod-usb-acm=y
CONFIG_PACKAGE_kmod-usb-net=y
CONFIG_PACKAGE_kmod-usb-net-cdc-ether=y
CONFIG_PACKAGE_kmod-usb-net-rndis=y
CONFIG
make defconfig
make -j"$JOBS" download
make -j"$JOBS" V=s
printf '
Build finished. RAM-boot-only candidates:
'
find bin/targets/ramips/mt76x8 -type f -name '*initramfs*.bin' -print
printf 'DO NOT flash or sysupgrade this reference-board image.
'
