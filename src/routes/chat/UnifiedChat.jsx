import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";
import ChatListSidebar from "../../components/chat/ChatListSidebar.jsx";
import ChatArea from "../../components/chat/ChatArea.jsx";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";

export default function UnifiedChat() {
    const { chatId, chatName } = useParams();
    const [selectedChat, setSelectedChat] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const customNavigate = useCustomNavigate();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Update URL when chat is selected
    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        if (isMobile) {
            setMobileOpen(false);
        }
        // Update URL to reflect selected chat
        const newPath = `/chats/${chat.id}/${encodeURIComponent(chat.name)}`;
        navigate(newPath, { replace: true });
    };

    // Handle direct navigation to a specific chat
    useEffect(() => {
        if (chatId && chatName) {
            // If we have chatId in URL, create a chat object from the URL params
            const chatFromUrl = {
                id: chatId,
                name: decodeURIComponent(chatName),
            };
            setSelectedChat(chatFromUrl);
        } else {
            // If no chatId in URL, clear selected chat
            setSelectedChat(null);
        }
    }, [chatId, chatName]);

    const handleCreateChat = () => {
        customNavigate("/chat/create");
    };

    const handleChatsLoaded = (chats) => {
        // If we have a selectedChat from URL but it's not in the loaded chats,
        // we need to find it or handle the case
        if (selectedChat && chatId) {
            const foundChat = chats.find((chat) => chat.id === chatId);
            if (foundChat) {
                setSelectedChat(foundChat);
            }
            // If chat not found in list, keep the URL-based chat object
            // This handles cases where the chat exists but isn't in the user's list
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const sidebarContent = <ChatListSidebar selectedChatId={selectedChat?.id} onChatSelect={handleChatSelect} onCreateChat={handleCreateChat} onChatsLoaded={handleChatsLoaded} />;

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                bgcolor: "background.default",
                overflow: "hidden",
            }}
        >
            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: "block", md: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: 280,
                            bgcolor: "background.paper",
                        },
                    }}
                >
                    {sidebarContent}
                </Drawer>
            )}

            {/* Desktop Sidebar */}
            {!isMobile && (
                <Box
                    sx={{
                        width: 280,
                        flexShrink: 0,
                        borderRight: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    {sidebarContent}
                </Box>
            )}

            {/* Main Chat Area */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0, // Important for flexbox
                }}
            >
                {/* Mobile Header */}
                {isMobile && (
                    <Box
                        sx={{
                            p: 1,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{
                                ml: 0,
                                p: 1,
                                borderRadius: 1,
                                "&:hover": {
                                    bgcolor: "action.hover",
                                },
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "primary.main",
                                fontWeight: 600,
                                flex: 1,
                                textAlign: "center",
                                fontSize: "1.1rem",
                            }}
                        >
                            {selectedChat ? selectedChat.name : "Чаты"}
                        </Typography>
                        <Box sx={{ width: 48 }} /> {/* Spacer to balance the layout */}
                    </Box>
                )}

                {/* Chat Area */}
                <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ChatArea selectedChat={selectedChat} />
                </Box>
            </Box>
        </Box>
    );
}
