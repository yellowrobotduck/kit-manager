import {SlackProfileManager} from "./SlackProfileManager.mjs"

// Called when user opens the app - return a view of available profiles
export const createHome = async(profileConfig, userEmail) => {
    if(!profileConfig.profiles){
        return;
    }
    // Note: iterate profiles might be better solution here as it can flag the groups with the same name.
    // Note: though the method used below is using less API calls
    const profileManager = new SlackProfileManager()
    const userWithGroups = await profileManager.lookupUserGroupByEmail(userEmail);
    const view = {
        "type": "home",
        "blocks": [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "Hey Robot!\n\nYou will use this Twingate Slackbot to add or remove yourself from the _Full Tunnel Access_ group.\n\nBeing in the _Full Tunnel Access_ group allows you to:\n1. Play on your Dev or Test Kit\n2. Play with a DEV PSN\n\n*It is always best practice to remove your Full Tunnel Access once you are done*\n\n_If you're having issues activating or connecting to your kit, it never hurts to try resharing your Twingate VPN._"
                }
            },
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: "<https://badrobotgames.atlassian.net/wiki/spaces/ITDSS/pages/1547436033/Setting+up+Twingate+for+Dev+Test+Kit+Playtesting#Playtesting-with-Twingate|KA for Playing with Twingate> and <https://badrobotgames.atlassian.net/wiki/spaces/TDH/pages/1516208129/Setting+up+a+development+PSN+account|KA for PSN Accounts>"
                    }
                ]
            }
        ]
    }
    if (!userWithGroups) {
        console.log(`Email '${userEmail}' not found in Twingate`)
        view.blocks.push({
                type: "divider"
            },
            {
                type: "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*ERROR*\n Email '${userEmail}' not found in Twingate, please ensure your Slack account email address is the same as your Twingate email address.`
                }
            })
         return view
    }

    const permittedProfiles = profileConfig.profiles.filter(profile => userWithGroups.groups.map(group=>group.name).includes(profile.applicableToGroup))

    for (const permittedProfile of permittedProfiles){
        const block = await permittedProfile.getAppHomeBlock(userWithGroups);
        if ( block != null ) view.blocks.push({type: "divider"}, block);
    }
    return view
};